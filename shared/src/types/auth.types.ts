export interface UserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}