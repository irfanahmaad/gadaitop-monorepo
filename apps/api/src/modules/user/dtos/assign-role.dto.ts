import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
