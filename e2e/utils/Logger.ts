export class Logger {
  private readonly GREEN: string = '\x1b[32m';
  private readonly RED: string = '\x1b[31m';
  private readonly RESET: string = '\x1b[0m';
  private readonly YELLOW: string = '\x1b[33m';

  constructor(private testName: string) {}

  log = (message: string, indent: number = 0): void =>
    console.log(this.format(message, indent, 'none'));

  success = (message: string, indent: number = 0): void =>
    console.log(this.format(message, indent, 'green'));

  warn = (message: string, indent: number = 0): void =>
    console.warn(this.format(message, indent, 'yellow'));

  error = (message: string, indent: number = 0): void =>
    console.error(this.format(message, indent, 'red'));

  format(
    message: string,
    indent: number = 0,
    color: 'green' | 'yellow' | 'red' | 'none' = 'none'
  ): string {
    let icon: string = ' ';
    let setColor: string = '';
    let resetColor: string = '';

    switch (color) {
      case 'green':
        icon = '✓';
        setColor = this.GREEN;
        resetColor = this.RESET;
        break;
      case 'red':
        icon = '✗';
        setColor = this.RED;
        resetColor = this.RESET;
        break;
      case 'yellow':
        icon = '⚠';
        setColor = this.YELLOW;
        resetColor = this.RESET;
        break;
      case 'none':
      default:
        break;
    }

    let shiftedMessage = this.shift(message, indent);
    let finalMessage = icon ? `${icon} ${shiftedMessage}` : shiftedMessage;

    return `[${this.testName}] ${setColor}${finalMessage}${resetColor}`;
  }

  /**
   * Shifts the message by the specified number of indents
   * @param message - The message to shift
   * @param indent - Number of indents
   * @returns - The shifted message
   */
  private shift(message: string, indent: number): string {
    if (indent === 0) {
      return message;
    }

    const indentPrefix = ' '.repeat(indent + -1) + '↳';

    return `${indentPrefix} ${message}`;
  }
}
