import { DeviceRegistrationEntity } from '../entities/device-registration.entity';

export class DeviceRegistrationDto extends DeviceRegistrationEntity {
  constructor(device: DeviceRegistrationEntity) {
    super();
    Object.assign(this, device);
  }
}
