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

            test('only the user who added the blog sees the delete button', async ({ page }) => {
                await page.pause() // Pause for manual inspection if needed
            
                // Ensure the user is logged out and log in as 'test'
                const logoutButton = page.getByTestId('logout-button')
                await expect(logoutButton).toBeVisible()
                await logoutButton.click()
            
                // Login as 'test' user
                await loginWith(page, 'test', 'test')
            
                // Wait for the page to be fully loaded
                await page.waitForLoadState('networkidle')
            
                const blogTitle = 'first blog'
                const blogElement = await page.locator(`.blog:has-text("Title: ${blogTitle}")`)
                
                // Set a mock current user in localStorage
                const mockCurrentUser = {
                    username: 'test', // Ensure this matches your actual test user
                    token: 'testToken' // You may need an actual token or relevant value
                }
                await page.evaluate((user) => {
                    window.localStorage.setItem('currentUser', JSON.stringify(user))
                }, mockCurrentUser)
                
                // Retrieve and log the current user from localStorage
                const currentUser = await page.evaluate(() => {
                    return JSON.parse(window.localStorage.getItem('currentUser'))
                })
                console.log('Current User:', currentUser)
                
                // Get the blog's user name
                const blogUserId = await blogElement.evaluate(el => {
                    const deleteButton = el.querySelector('[data-testid="delete-button"]')
                    return deleteButton ? deleteButton.getAttribute('data-user-id') : null
                })
                console.log('Blog User ID:', blogUserId)

                // Fetch user details from backend
                const userResponse = await page.request.get(`/api/users/${blogUserId}`)
                const blogUser = await userResponse.json()
                console.log('Blog User:', blogUser)
                
                // Ensure blog details are visible
                await blogElement.locator('[data-testid="toggle-details"]').click()

                // Log the entire blogElement HTML
                const blogHtml = await blogElement.evaluate(el => el.outerHTML)
                console.log('Blog Element HTML:', blogHtml)

                // Check if the delete button is visible for the logged-in user
                if (currentUser.username === blogUser.username) {
                    await expect(blogElement.locator('[data-testid="delete-button"]')).toBeVisible()
                } else {
                    await expect(blogElement.locator('[data-testid="delete-button"]')).toHaveCount(0)
                }
            
                // Log out and log in as 'other' user
                await page.getByTestId('logout-button').click()
                await loginWith(page, 'other', 'other')
            
                // Wait for the page to be fully loaded again
                await page.waitForLoadState('networkidle')
            
                // Ensure the blog details are visible
                await blogElement.locator('[data-testid="toggle-details"]').click()
            
                // Get the new blog's user name (should be the same blog but viewed by 'other' user)
                const newBlogUser = await blogElement.evaluate(el => {
                    const deleteButton = el.querySelector('[data-testid="delete-button"]')
                    return deleteButton ? deleteButton.getAttribute('data-user') : null
                })
                console.log('New Blog User:', newBlogUser)
            
                // Check if the delete button is visible for the 'other' user
                await expect(blogElement.locator('[data-testid="delete-button"]')).toHaveCount(0)
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
        })
    }) 
})