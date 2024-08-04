import { Request, Response } from 'express';
import * as userService from '../service/userService.js';
import { authService } from '../service/authService.js';

/**
 * Controller class for handling user-related operations.
 *
 * This class provides methods to handle user registration, login, OAuth2 login, profile retrieval,
 * profile picture update, and user sign-out. The methods interact with the user service and
 * authentication service to manage user data and sessions.
 *
 */
class UserController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.loginOAuth2 = this.loginOAuth2.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfilePicture = this.updateProfilePicture.bind(this);
  }

  async register(req: Request, res: Response): Promise<void> {
    const userDAO = req.app.locals.userDAO;
    const user = await userService.registerUser(userDAO, req.body);
    authService.createAndSetToken({ id: user.id }, res);
    res.status(200).json({ message: 'Dein Account wurde erfolgreich erstellt' });
  }

  async login(req: Request, res: Response) {
    const userDAO = req.app.locals.userDAO;
    const user = await userService.loginUser(userDAO, req.body.email, req.body.password);
    if (!user) {
      authService.removeToken(res);
      return res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
    }
    authService.createAndSetToken({ id: user.id }, res);
    res.status(200).json({ message: 'Erfolgreich eingeloggt' });
  }

  async loginOAuth2(req: Request, res: Response): Promise<void> {
    const userDAO = req.app.locals.userDAO;
    const user = await userService.loginOAuth2User(userDAO, req.body.credential);
    authService.createAndSetToken({ id: user.id }, res);
    res.redirect('http://localhost:4200/training?login=success');
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const user = await userService.getUser(req, res);
    const formattedCreatedAt = new Date(user.createdAt).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const userDto = {
      username: user.username,
      email: user.email,
      createdAt: formattedCreatedAt,
      pictureUrl: user.pictureUrl
    };

    res.status(200).json({ userDto });
  }

  async updateProfilePicture(req: Request, res: Response): Promise<Response> {
    const userDAO = req.app.locals.userDAO;
    const user = await userService.getUser(req, res);
    const profilePicture = req.body.profilePicture;

    if (!profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found in request body' });
    }

    user.pictureUrl = profilePicture;
    await userDAO.update(user);

    return res.status(200).json({ message: 'Dein Profilbild wurde erfolgreich geupdated' });
  }

  signOut(req: Request, res: Response): void {
    authService.removeToken(res);
    res.status(200).json({ message: 'Token erfolgreich entfernt' });
  }
}

export default UserController;
