import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ) {}

  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      delete user.password;

      await this.userRepository.save( user );

      return user;
      
    } catch (error) {

      this.handleDBErrors( error );

    }

  }

  async login( loginUserDto: LoginUserDto ) {

    try {

      const { password, email } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true }
      });

      if ( !user ) throw new UnauthorizedException('Credential are not valid');

      if ( !bcrypt.compareSync( password, user.password ) )
        throw new UnauthorizedException('Credential are not valid');

      return user;
      
    } catch (error) {
      
      this.handleDBErrors( error );

    }

  }

  private handleDBErrors( error: any ): never {

    if ( error.code === '23505' ) throw new BadRequestException( error.detail );

    console.log( error );

    throw new InternalServerErrorException('Please chech internal server errors')
    
  }

}
