import { DataServiceBase, Metadata } from './DataServiceBase';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { User } from '../models';

@Injectable()
export class UserDataService extends DataServiceBase<User> {
    private static metadata: Metadata<User> = {};
    constructor(http: Http) {
        super('users', http, UserDataService.metadata);
    }

    toEntity(data: Partial<User>) {
        return Object.assign(new User(), data) as User;
    }
}

