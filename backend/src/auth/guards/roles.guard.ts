import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from the endpoint metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // If no user is authenticated, deny access
    if (!user) {
      return false;
    }

    // Get the complete user profile with role information
    const userProfile = await this.usersService.findOne(user.userId);

    // If user doesn't have role or required role, deny access
    if (!userProfile || !userProfile.role || !requiredRoles.includes(userProfile.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}