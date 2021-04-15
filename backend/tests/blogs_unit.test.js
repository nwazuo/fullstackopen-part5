const listHelper = require('../utils/list_helper')
const mostBlogs = require('../utils/list_helper').mostBlogs;

const totalLikes = listHelper.totalLikes
const favoriteBlog = listHelper.favoriteBlog

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]
const blogs = [{ _id: "5a422a851b54a676234d17f7", title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7, __v: 0 }, { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 }, { _id: "5a422b3a1b54a676234d17f9", title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12, __v: 0 }, { _id: "5a422b891b54a676234d17fa", title: "First class tests", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", likes: 10, __v: 0 }, { _id: "5a422ba71b54a676234d17fb", title: "TDD harms architecture", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", likes: 0, __v: 0 }, { _id: "5a422bc61b54a676234d17fc", title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 }
]
describe('total likes', () => {


  test('of empty list is zero', () => {
    expect(totalLikes([])).toBe(0)
  })

  test('of a list with one blog is its number of likes', () => {
    expect(totalLikes(listWithOneBlog)).toBe(5)
  })

  test('of a list with multiple blogs is calculated right', () => {
    expect(totalLikes(blogs)).toBe(36)
  })
})

describe('favorites', () => {
  test('with an empty list is null', () => {
    expect(favoriteBlog([])).toBe(null);
  })

  test('with no value is null', () => {
    expect(favoriteBlog()).toBe(null);
  })

  test('list with a single blog returns that blog', () => {
    expect(favoriteBlog(listWithOneBlog)).toEqual(listWithOneBlog[0]);
  })

  test('list with multiple blogs is calculated right', () => {
    expect(favoriteBlog(blogs)).toEqual(blogs[2]);
  })
})

describe('most blogs', () => {
    test(' with empty blog list returns null', () => {
        expect(mostBlogs()).toBe(null);
    })

    test(' list with one blog returns the author and blogs count', () => {
        expect(mostBlogs([blogs[0]])).toEqual({author: "Michael Chan", blogs: 1});
    })

    test('list with multiple blogs returns author with highest blogs', () => {
        expect(mostBlogs(blogs)).toEqual({author: 'Robert C. Martin', blogs: 3 })
    })
})