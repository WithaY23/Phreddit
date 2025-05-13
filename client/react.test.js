

import Banner from './src/components/banner';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom'

import React from 'react';
import userEvent from '@testing-library/user-event';
// function login()
// {

// }
// function guest()
// {

// }
// function findPostButton() //maybe use post button?
// {

// }
test('User is logged out and post button is not available', () =>
{
    const mockSetView = jest.fn();
     render(
        <Banner
            view={'view'}
            setView={mockSetView}
            setSearchTerms={'setSearchTerms'}
            currentUser={null}
            setPage={() => {}}
            setCurrentUser={() => {}}
        />
    );
    const createPost = screen.getByText('Create Post');
    userEvent.click(createPost);
    expect(createPost).toHaveStyle('background-color: gray');

})



test('User is logged in and post button is available' ,() =>
{
    const mockSetView = jest.fn();
    render(
        <Banner
            view={'view'}
            setView={mockSetView}
            setSearchTerms={'setSearchTerms'}
            currentUser={'aaaa'}
            setPage={() => {}}
            setCurrentUser={() => {}}
        />)
    const createPost = screen.getByText('Create Post');
    userEvent.click(createPost);
    expect(mockSetView).toHaveBeenCalledWith('Create-Post-Page');
})