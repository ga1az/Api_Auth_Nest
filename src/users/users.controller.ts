import { Body, Controller, Get, Post, ParseIntPipe } from '@nestjs/common';
import { Delete, Param, Patch, UseGuards } from '@nestjs/common/decorators';
import { createUserDto } from './dto/create-user.dto';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { updateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() user: createUserDto) {
    return this.usersService.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: updateUserDto,
  ) {
    return this.usersService.updateUser(id, user);
  }

  @Post('login')
  login(@Body() user: createUserDto) {
    return this.usersService.login(user);
  }
}
