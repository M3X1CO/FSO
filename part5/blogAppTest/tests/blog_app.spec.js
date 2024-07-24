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
            
            test('users can only delete their own blogs', async ({ page }) => {
                await page.pause()
                // Create a blog as 'test' user
                await createBlog(page, 'Test User Blog', 'Test Author', 'http://testblog.com', 0)
              
                // Verify the blog is visible and can be deleted
                const testBlogElement = await page.locator('.blog:has-text("Title: Test User Blog")')
                await expect(testBlogElement).toBeVisible()
                await testBlogElement.locator('[data-testid="toggle-details"]').click()
                await expect(testBlogElement.locator('[data-testid="delete-button"]')).toBeVisible()
              
                // Log out
                await page.locator('[data-testid="logout-button"]').click()
              
                // Log in as 'other' user
                await loginWith(page, 'other', 'other')
              
                // Verify the blog created by 'test' user is visible but cannot be deleted
                const otherUserView = await page.locator('.blog:has-text("Title: Test User Blog")')
                await expect(otherUserView).toBeVisible()
                await otherUserView.locator('[data-testid="toggle-details"]').click()
                await expect(otherUserView.locator('[data-testid="delete-button"]')).not.toBeVisible()
              
                // Log out
                await page.locator('[data-testid="logout-button"]').click()
              
                // Log back in as 'test' user
                await loginWith(page, 'test', 'test')
              
                // Delete the blog
                const blogToDelete = await page.locator('.blog:has-text("Title: Test User Blog")')
                await blogToDelete.locator('[data-testid="toggle-details"]').click()
                
                // Handle the confirmation dialog
                page.on('dialog', dialog => dialog.accept())
                await blogToDelete.locator('[data-testid="delete-button"]').click()
              
                // Verify the blog has been deleted
                await expect(page.locator('.blog:has-text("Title: Test User Blog")')).not.toBeVisible()
              })
        
            test('a blog can be liked', async ({ page }) => {
                await page.pause()
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
                await expect(blogElement.locator('p', { hasText: /Votes/ })).toContainText('Votes: 1')

                // Click the 'Hide' button to close details
                await blogElement.locator('[data-testid="toggle-details"]').click()
            })

            test('blogs are ordered by likes in descending order', async ({ page }) => {
                // Create blogs with different numbers of likes
                await createBlog(page, 'Least liked blog', 'Author1', 'http://blog1.com', 2)
                await createBlog(page, 'Most liked blog', 'Author2', 'http://blog2.com', 5)
                await createBlog(page, 'Medium liked blog', 'Author3', 'http://blog3.com', 3)
              
                // Wait for all blogs to be visible and for the page to stabilize
                await page.waitForSelector('.blog')
                await page.waitForTimeout(1000) // Wait for potential re-ordering
              
                // Function to extract likes from a blog element
                const getLikes = async (element) => {
                  await element.locator('[data-testid="toggle-details"]').click()
                  const likesElement = element.locator('[data-testid="like-count"]')
                  await likesElement.waitFor({ state: 'visible' })
                  const likesText = await likesElement.textContent()
                  await element.locator('[data-testid="toggle-details"]').click() // Hide details again
                  const likes = parseInt(likesText.match(/\d+/)[0])
                  console.log(`Extracted likes: ${likes}`) // For debugging
                  return likes
                }
              
                // Get all blog elements
                const blogElements = await page.locator('.blog').all()
              
                // Extract likes for all blogs
                const blogLikes = await Promise.all(blogElements.map(getLikes))
              
                // Check if blogs are in descending order of likes
                for (let i = 0; i < blogLikes.length - 1; i++) {
                  expect(blogLikes[i]).toBeGreaterThanOrEqual(blogLikes[i + 1])
                }
              
                // Verify the order of blog titles
                const blogTitles = await page.locator('.blog').allTextContents()
                expect(blogTitles[0]).toContain('Most liked blog')
                expect(blogTitles[1]).toContain('Medium liked blog')
                expect(blogTitles[2]).toContain('Least liked blog')
            })
        })
    }) 
})