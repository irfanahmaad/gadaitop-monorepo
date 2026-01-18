import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOptionsRelations,
  type FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import { generateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
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

  async findAll(options: QueryUserDto): Promise<{
    data: UserDto[];
    meta: PageMetaDto;
  }> {
    // Check if we need to filter by role code
    const roleCode = options.roleCode;

    if (roleCode) {
      // Use query builder for role filtering with join
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .where('role.code = :roleCode', { roleCode });

      // Apply sorting
      if (options.sortBy) {
        queryBuilder.orderBy(`user.${options.sortBy}`, options.order || 'ASC');
      } else {
        queryBuilder.orderBy('user.id', 'ASC');
      }

      // Apply pagination
      queryBuilder.skip(options.getSkip());
      const take = options.getTake();
      if (take !== undefined) {
        queryBuilder.take(take);
      }

      const [res, count] = await queryBuilder.getManyAndCount();

      const data = res.map((user) => new UserDto(user));
      const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

      return { data, meta };
    }

    // Default behavior without role filtering
    const findOptions: any = {
      relations: { roles: true },
      skip: options.getSkip(),
      order: options.sortBy
        ? { [options.sortBy]: options.order }
        : { id: 'ASC' },
    };

    // Only add take if pageSize is not 0 (0 means load all)
    const take = options.getTake();
    if (take !== undefined) {
      findOptions.take = take;
    }

    const [res, count] = await this.userRepository.findAndCount(findOptions);

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

    await this.userRepository.remove(user);
  }
}
