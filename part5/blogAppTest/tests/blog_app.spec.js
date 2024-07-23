const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
            data: {
                name: 'test',
                username: 'test',
                password: 'test'
            }
        })

        await request.post('/api/users', {
            data: {
                name: 'other',
                username: 'other',
                password: 'other'
            }
        })

        await page.goto('/')
    })

    test('only the user who added the blog sees the delete button', async ({ page }) => {
        // Log in as 'test' user and create a blog
        await loginWith(page, 'test', 'test')
        await createBlog(page, 'thirst blog', 'author1', 'url1.com', 0)

        // Ensure the logout button is visible and click it
        const logoutButton = page.getByTestId('logout-button')
        await expect(logoutButton).toBeVisible()
        await logoutButton.click()

        // Log in as 'other' user
        await loginWith(page, 'other', 'other')

        // Ensure the blog details are visible
        const blogTitle = 'thirst blog'
        const blogElement = await page.locator(`.blog:has-text("Title: ${blogTitle}")`)
        await blogElement.locator('[data-testid="toggle-details"]').click()

        // Check that the delete button is not visible for 'other' user
        await expect(blogElement.locator('[data-testid="delete-button"]')).toHaveCount(0)

        // Log out by navigating back to home page
        await page.goto('/')

        // Log back in as 'test' user
        await loginWith(page, 'test', 'test')

        // Ensure the blog details are visible
        await blogElement.locator('[data-testid="toggle-details"]').click()

        // Check that the delete button is visible for 'test' user
        await expect(blogElement.locator('[data-testid="delete-button"]')).toHaveCount(1)
    })
    
    test('front page can be opened', async ({ page }) => {
        const locator = await page.getByText('Blogs')
        await expect(locator).toBeVisible()
        await expect(page.getByText('Blog app, Department of Computer Science, University of Helsinki 2024')).toBeVisible()
    })
    
    test('user can log in', async ({ page }) => {
        await loginWith(page, 'test', 'test')
        await expect(page.getByText('test logged in')).toBeVisible()
    })
    
    test('login fails with wrong password', async ({ page }) => {
        await loginWith(page, 'notTest', 'notTest')
        const errorDiv = await page.locator('.error')
        await expect(errorDiv).toContainText('Wrong Credentials')
        await expect(errorDiv).toHaveCSS('border-style', 'solid')
        await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

        await expect(page.getByText('test logged in')).not.toBeVisible()
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'test', 'test')
        })

        describe('and a blog exists', () => {
            beforeEach(async ({ page }) => {
                await createBlog(page, 'first blog', 'author1', 'url1.com', 0)
                await createBlog(page, 'second blog', 'author2', 'url2.com', 0)
                await createBlog(page, 'third blog', 'author3', 'url3.com', 0)
            })
        
            test('a blog can be liked', async ({ page }) => {
                const blogTitle = 'second blog'
                
                // Locate the blog element
                const blogElement = await page.locator(`.blog:has-text("Title: ${blogTitle}")`)
                
                // Click the 'View' button to show details
                await blogElement.locator('[data-testid="toggle-details"]').click()
                
                // Wait for the 'Like' button to be visible
                await blogElement.locator('[data-testid="like-button"]').waitFor()
                
                // Click the 'Like' button
                await blogElement.locator('[data-testid="like-button"]').click()
                
                // Verify the like count has increased
                await expect(blogElement.locator('p', { hasText: /Votes/ })).toContainText('1 Votes')

                // Click the 'Hide' button to close details
                await blogElement.locator('[data-testid="toggle-details"]').click()
            })  
            
            test('a blog can be deleted by the user who added it', async ({ page }) => {
                const blogTitle = 'first blog'
            
                // Locate the blog element
                const blogElement = await page.locator(`.blog:has-text("Title: ${blogTitle}")`)
            
                // Click the 'View' button to show details
                await blogElement.locator('[data-testid="toggle-details"]').click()
            
                // Wait for the 'Delete' button to be visible
                await blogElement.locator('[data-testid="delete-button"]').waitFor()
            
                // Mock the window.confirm dialog to automatically accept
                await page.evaluate(() => {
                    window.confirm = () => true
                })
            
                // Click the 'Delete' button
                await blogElement.locator('[data-testid="delete-button"]').click()
            
                // Verify the blog is no longer in the list
                await expect(page.locator(`.blog:has-text("Title: ${blogTitle}")`)).toHaveCount(0)
            })
        })
    }) 
})