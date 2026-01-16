import { Global, Module } from '@nestjs/common';
import type { Provider } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';
import { ValidatorService } from './services/validator.service';

const providers: Provider[] = [ApiConfigService, ValidatorService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
