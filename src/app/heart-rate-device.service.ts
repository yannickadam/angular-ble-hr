import { Injectable } from '@angular/core';
import { ReplaySubject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeartRateDeviceService {

  private heartRateSubject = new ReplaySubject(1);
  /** When connected, emits heart rate */
  public heartRate$ = this.heartRateSubject.asObservable();
  
  private connectedSubject = new BehaviorSubject(false);
  /** Emits (true) when the device is connected, (false) otherwise */
  public connected$ = this.connectedSubject.asObservable();

  constructor() {}

  /**
   * This method will open the navigator web bluetooth dialog,
   * with a list of devices exposing the heart rate service.
   * 
   * You can then use connected$ and heartRate$ observables to retrieve information.
   */
  public async connect() {

    if (!navigator.bluetooth) { throw new Error('This browser does not support Web Bluetooth.'); }

    const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
    if (!device) { throw new Error('No device found / requested.'); }  
    device.addEventListener('gattserverdisconnected', this.deviceDisconnected.bind(this));

    const server = await device.gatt.connect();
    if (!server) { throw new Error(`Connection failed to device ${device.name}`); }

    const service = await server.getPrimaryService('heart_rate');
    if (!service) { throw new Error(`Could not retrieve heart rate service`); }

    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    if (!characteristic) { throw new Error(`Could not retrieve heart rate characteristic`); }

    characteristic.addEventListener( 'characteristicvaluechanged', this.heartRateChanged.bind(this) );
    await characteristic.startNotifications();

    this.connectedSubject.next(true);
  }

  private heartRateChanged(event) {
    const value = event.target.value;
    const currentHeartRate = value.getUint8(1);
    this.heartRateSubject.next(currentHeartRate);
  }

  private deviceDisconnected(event) {
    this.connectedSubject.next(false);
  }
 

}
