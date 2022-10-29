import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: createUserDto) {
    const userFind = await this.userRepository.findOne({
      where: {
        username: user.username,
      },
    });
    if (userFind) {
      return new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const { password } = user;
    const hashPass = await hash(password, 10);
    user = { ...user, password: hashPass };
    const newUser = await this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  getUsers() {
    return this.userRepository.find();
  }

  getUserById(id: number) {
    const userFound = this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!userFound) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return userFound;
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete({ id: id });
    if (result.affected === 0) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async updateUser(id: number, user: updateUserDto) {
    const userFound = await this.getUserById(id);

    if (!userFound) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = Object.assign(userFound, user);

    return this.userRepository.save(updatedUser);
  }

  async login(user: createUserDto) {
    const { username, password } = user;
    const userFound = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!userFound) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const checkPass = await compare(password, userFound.password);

    // Verificar si la contraseña es correcta
    if (!checkPass) {
      return new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const payload = { id: userFound.id, username: userFound.username };
    const token = this.jwtService.sign(payload);

    const data = {
      user: userFound,
      token,
    };

    return data;
  }
}
