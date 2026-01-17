import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type FindOptionsRelations,
  type FindOptionsWhere,
  Repository,
} from 'typeorm';

import { generateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import type { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { ActiveStatusEnum } from '../../constants/active-status';
import { UserRegisterDto } from '../auth/dtos/user-register.dto';
import { RoleEntity } from '../role/entities/role.entity';
import { UserDto } from './dtos/user.dto';
import { UserEntity } from './entities/user.entity';

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

  async findAll(options: PageOptionsDto): Promise<{
    data: UserDto[];
    meta: PageMetaDto;
  }> {
    const [res, count] = await this.userRepository.findAndCount({
      relations: { roles: true },
      skip: options.skip,
      take: options.pageSize,
      order: options.sortBy
        ? { [options.sortBy]: options.order }
        : { id: 'ASC' },
    });

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
}
