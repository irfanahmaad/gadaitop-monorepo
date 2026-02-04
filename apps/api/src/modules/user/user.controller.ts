import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AssignRoleDto } from './dtos/assign-role.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.USER }])
  async findAll(@Query() query: QueryUserDto): Promise<{
    data: UserDto[];
    meta: PageMetaDto;
  }> {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.USER }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.userService.findOne({ uuid: id });
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.USER }])
  async create(@Body() createDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createDto);
  }

  @Patch(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.USER }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.updateByUuid(id, updateDto);
  }

  @Post(':id/assign-roles')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.USER }])
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignRoleDto,
  ): Promise<UserDto> {
    return this.userService.assignRoles(id, assignDto);
  }

  @Post(':id/reset-password')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.USER }])
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.resetPassword(id, resetDto);
    return { message: 'Password reset successfully' };
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.USER }])
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.userService.deleteByUuid(id);
    return { message: 'User deleted successfully' };
  }
}
