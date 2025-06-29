import { IUserDocument, UserRole } from '../../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        document?: IUserDocument;
      };
      query?: {
        limit?: string;
        sort?: string;
        fields?: string;
        [key: string]: any;
      };
    }
  }
}
