import {BehaviorSubject, Subject} from 'rxjs';

import {Injectable} from '@angular/core';
import {User} from '../models';

/**
 * UserService manages our current user
 */
@Injectable()
export class UserService {
  // `currentUser` contains the current user
  currentUser$: Subject<User> = new BehaviorSubject<User>(null);

  constructor() {
    console.log('UserService created');
  }
  public setCurrentUser(newUser: User): void {
    this.currentUser$.next(newUser);
  }
}

export var userServiceInjectables: Array<any> = [
  UserService
];
