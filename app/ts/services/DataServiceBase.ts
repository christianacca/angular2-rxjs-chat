import { Observable } from 'rxjs';
import { EntityBase } from './../models';
import { Response, Http } from '@angular/http';
import * as _ from 'lodash';

export interface Metadata<T extends EntityBase> {
    dateProperties?: Array<keyof T>;
}

export abstract class DataServiceBase<T extends EntityBase> {

    private static baseMetadata: Metadata<EntityBase> = {
        dateProperties: ['createdOn']
    };

    metadata: Metadata<T>;
    resourceUrl: string;
    private parseField: (value: any, key: keyof T) => any;

    private static parseField<T extends EntityBase>(metadata: Metadata<T>, value: any, key: keyof T): any {
        return metadata.dateProperties.indexOf(key) !== -1 ? new Date(value) : value;
    }

    protected constructor(private collectionName: string, protected http: Http, metadata: Metadata<T>) {
        this.resourceUrl = `api/${collectionName}`;
        this.metadata = {
            dateProperties: (metadata.dateProperties || []).concat(DataServiceBase.baseMetadata.dateProperties)
        };
        this.parseField = _.partial(DataServiceBase.parseField, this.metadata);
    }

    getAll() {
        return this.http.get(this.resourceUrl)
            .map(response => this.extractList(response));
    }

    getByCreatedOnAfter(date: Date) {
        return this.fakeServerFilter(x => x.createdOn > date);
    }

    getByIds(ids: number[]) {
        if ((ids || []).length === 0) {
            return Observable.of<Partial<T>[]>([]);
        }
        return this.fakeServerFilter(x => ids.indexOf(x.id) !== -1);
    }

    save(entity: T) {
        if (entity.setForeignKeys) {
            entity.setForeignKeys();
        }
        return this.http.post(this.resourceUrl, this.toDto(entity))
            .map(response => this.extractOne(response))
            .map(dto => {
                entity.id = dto.id;
                return entity;
            });
    }

    toDto<K extends keyof T>(entity: T, customNavigationProps: K[] = []): Partial<T> {
        const fkNames = Object.keys(entity).filter(key => key.endsWith('Id'));
        const navNames = fkNames.map(name => name.replace('Id', ''))
            .concat(customNavigationProps);
        return Object.assign({}, entity, _.zipObject(navNames, []));
    }

    protected extractList(response: Response): Partial<T>[] {
        const rawObjs = response.json().data || [];
        return rawObjs.map(o => this.parseProperties(o));
    }

    protected extractOne(response: Response): Partial<T> {
        const rawObj = response.json().data || {};
        return this.parseProperties(rawObj);
    }

    private fakeServerFilter(predicate: (x: T) => boolean) {
        return this.getAll().map(entities => {
            return entities.filter(predicate);
        });
    }

    private parseProperties(dto: Partial<T>) {
        const result = _.mapValues<Partial<T>>(dto, this.parseField);
        return result;
    }
}
