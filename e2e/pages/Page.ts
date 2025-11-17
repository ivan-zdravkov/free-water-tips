import { WebDriver } from 'selenium-webdriver';
import { Logger } from '../utils/Logger';

export interface Page {
  readonly name: string;
}

export type PageConstructor<T extends Page> = new (driver: WebDriver, logger: Logger) => T;
