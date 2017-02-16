import React from 'react';
import {render, mount} from 'enzyme';
import FlipCard from './FlipCard';

it('renders without crashing with no children', () => {
  expect(() => {render(<FlipCard />);}).not.toThrow();
});

it('displays the first two children', () => {
  const component = mount(<FlipCard><div>hello</div><div>there</div></FlipCard>);
  
  expect(component.text()).toContain('hello');
  expect(component.text()).toContain('there');
});

it('throws if only one child is present', () => {
  expect(() => {
    mount(<FlipCard><div>1</div></FlipCard>);
  }).toThrow('FlipCard takes exactly two children. Only 1 was given.');
});

it('throws if three or more children are present', () => {
  expect(() => {
    mount(<FlipCard><div>1</div><div>2</div><div>3</div></FlipCard>);
  }).toThrow('FlipCard takes exactly two children. 3 were given.');
});
