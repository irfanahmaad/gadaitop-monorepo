import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import { generateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { ActiveStatusEnum } from '../../constants/active-status';
import { UserRegisterDto } from '../auth/dtos/user-register.dto';
import { RoleEntity } from '../role/entities/role.entity';
import { UserDto } from './dtos/user.dto';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AssignRoleDto } from './dtos/assign-role.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { QueryUserDto } from './dtos/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: findData,
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    return new UserDto(user);
  }

  /**
   * Lightweight method for JWT strategy validation.
   * Only selects id and accessToken — no relations join.
   * Used on every authenticated request, so performance is critical.
   */
  async findOneTokenStatus(
    userId: number,
  ): Promise<{ id: number; accessToken: string | null } | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'accessToken'],
    });
  }

  async findAll(options: QueryUserDto): Promise<{
    data: UserDto[];
    meta: PageMetaDto;
  }> {
    const qbOptions: QueryBuilderOptionsType<UserEntity> = {
      ...options,
      relation: { roles: true },
      orderBy: sortAttribute(options.sortBy, {
        fullName: { fullName: true },
        email: { email: true },
        activeStatus: { activeStatus: true },
      }) ?? { id: 'ASC' } as any,
    };

    const qb = UserEntity.createQueryBuilder('users');

    // roleCode requires a ManyToMany join that DynamicQueryBuilder can't handle
    // Use 'filterRoles' alias to avoid conflict with relation: { roles: true }
    if (options.roleCode) {
      qb.innerJoin('users.roles', 'filterRoles')
        .andWhere('filterRoles.code = :roleCode', {
          roleCode: options.roleCode,
        });
    }

    // Search by email or fullName (ILIKE)
    if (options.search?.trim()) {
      const searchPattern = `%${options.search.trim()}%`;
      qb.andWhere(
        '(users.email ILIKE :search OR users.fullName ILIKE :search)',
        { search: searchPattern },
      );
    }

    // Filter by company
    if (options.companyId) {
      qb.andWhere('users.companyId = :companyId', {
        companyId: options.companyId,
      });
    }

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.userRepository.metadata);
    const [res, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );

    const data = res.map((user) => new UserDto(user));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async checkEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.countBy({ email });

    return Boolean(user);
  }

  async registerUser(userRegisterDto: UserRegisterDto): Promise<UserDto> {
    try {
      const isExist = await this.checkEmail(userRegisterDto.email);

      if (isExist) {
        throw new HttpException(
          'Email is already registered, please login instead.',
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await generateHash(userRegisterDto.password);
      const user = this.userRepository.create({
        ...userRegisterDto,
        password: hashedPassword,
        activeStatus: ActiveStatusEnum.Active,
      });

      const savedUser = await this.userRepository.save(user);

      return new UserDto(savedUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, options: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    if (options.password) {
      options.password = await generateHash(options.password as string);
    }

    Object.assign(user, options);
    return this.userRepository.save(user);
  }

  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      accessToken: null,
      refreshToken: null,
    });
  }

  async validateEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { validateEmailToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid token');
    }

    if (user.validateEmailExpires && user.validateEmailExpires < new Date()) {
      throw new HttpException('Token expired', HttpStatus.PRECONDITION_FAILED);
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      validateEmailToken: null,
      validateEmailExpires: null,
    });
  }

  async create(createDto: CreateUserDto): Promise<UserDto> {
    const isExist = await this.checkEmail(createDto.email);

    if (isExist) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await generateHash(createDto.password);
    const user = this.userRepository.create({
      fullName: createDto.fullName,
      email: createDto.email,
      password: hashedPassword,
      phoneNumber: createDto.phoneNumber,
      imageUrl: createDto.imageUrl ?? null,
      companyId: createDto.companyId,
      branchId: createDto.branchId,
      activeStatus: ActiveStatusEnum.Active,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles if provided
    if (createDto.roleIds && createDto.roleIds.length > 0) {
      await this.assignRoles(savedUser.uuid, { roleIds: createDto.roleIds });
    }

    return this.findOne({ uuid: savedUser.uuid });
  }

  async updateByUuid(uuid: string, updateDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    Object.assign(user, updateDto);
    const updated = await this.userRepository.save(user);

    return new UserDto(updated);
  }

  async assignRoles(uuid: string, assignDto: AssignRoleDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    const roles = await this.roleRepository.find({
      where: { uuid: In(assignDto.roleIds) },
    });

    if (roles.length !== assignDto.roleIds.length) {
      throw new BadRequestException('One or more roles not found');
    }

    user.roles = roles;
    const updated = await this.userRepository.save(user);

    return new UserDto(updated);
  }

  async resetPassword(uuid: string, resetDto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    const hashedPassword = await generateHash(resetDto.newPassword);

    await this.userRepository.update(
      { uuid },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        accessToken: null,
        refreshToken: null, // Invalidate all sessions
      },
    );
  }

  async deleteByUuid(uuid: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    await this.userRepository.softDelete({ uuid });
  }
}
