import { SportsDataProvider } from '../interfaces/sports-data-provider';
import { SportMonksProvider } from './sportmonks-provider';

export class ProviderFactory {
  private static instance: SportsDataProvider | null = null;

  static getProvider(): SportsDataProvider {
    if (!this.instance) {
      const provider = process.env.NEXT_PUBLIC_SPORTS_DATA_PROVIDER || 'sportmonks';
      
      switch (provider) {
        case 'sportmonks':
          this.instance = new SportMonksProvider();
          break;
        // Future providers will be added here
        // case 'alternative':
        //   this.instance = new AlternativeProvider();
        //   break;
        default:
          this.instance = new SportMonksProvider();
      }
    }
    
    return this.instance;
  }

  // Method to force refresh provider (useful for testing)
  static resetProvider(): void {
    this.instance = null;
  }
}

