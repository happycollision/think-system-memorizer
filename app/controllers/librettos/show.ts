import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class LibrettosShowController extends Controller {
  @computed('model') get cards() { return [
    {front: 'Content for Front 1', back: 'content for back', isFlipped: false},
    {front: 'Content for Front 2', back: 'content for back', isFlipped: false},
    {front: 'Content for Front 3', back: 'content for back', isFlipped: false},
    {front: 'Content for Front 4', back: 'content for back', isFlipped: false},
    {front: 'Content for Front 5', back: 'content for back', isFlipped: false},
    {front: 'Content for Front 6', back: 'content for back', isFlipped: false},
  ]}
}
