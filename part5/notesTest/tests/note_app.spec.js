const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
            data: {
                name: 'test',
                username: 'test',
                password: 'test'
            }
        })

        await page.goto('/')
    })
    
    test('front page can be opened', async ({ page }) => {
        const locator = await page.getByText('Notes')
        await expect(locator).toBeVisible()
        await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2024')).toBeVisible()
    })
    
    test('user can log in', async ({ page }) => {
        // simple way
        // await page.getByRole('textbox').first().fill('test')
        // await page.getByRole('textbox').last().fill('test')
        
        // a little better way
        // const textboxes = await page.getByRole('textbox').all()
        // await textboxes[0].fill('test')
        // await textboxes[1].fill('test')
        
        // best way
        // await page.getByRole('button', { name: 'log in' }).click()
        // await page.getByTestId('username').fill('test')
        // await page.getByTestId('password').fill('test')
        // await page.getByRole('button', { name: 'login' }).click()

        // helper way
        await loginWith(page, 'test', 'test')
        await expect(page.getByText('test logged in')).toBeVisible()
    })
    
    test('login fails with wrong password', async ({ page }) => {
        await loginWith(page, 'notTest', 'notTest')
    
        const errorDiv = await page.locator('.error')
        await expect(errorDiv).toContainText('wrong credentials')
        await expect(errorDiv).toHaveCSS('border-style', 'solid')
        await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

        await expect(page.getByText('test logged in')).not.toBeVisible()
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'test', 'test')
        })
    
        // test('a new note can be created', async ({ page }) => {
        //     await createNote(page, 'another note by playwright')
        //     await expect(page.getByText('another note by playwright')).toBeVisible()
        // })

        describe('and a note exists', () => {
            beforeEach(async ({ page }) => {
                await createNote(page, 'first note', true)
                await createNote(page, 'second note', true)
                await createNote(page, 'third note', true)
            })
        
            test('importance can be changed', async ({ page }) => {
                const otherNoteText = await page.getByText('second note')
                const otherNoteElement = await otherNoteText.locator('..')
            
                await otherNoteElement.getByRole('button', { name: 'make not important' }).click()
                await expect(otherNoteElement.getByText('make important')).toBeVisible()
            })
        })
    }) 
})