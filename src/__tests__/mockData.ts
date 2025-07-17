export const mockUser = {
  name: 'John Test',
  email: 'john.test@example.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'user'
};

export const mockTour = {
  name: 'Amazing Tour 01',
  duration: 3,
  maxGroupSize: 10,
  difficulty: 'easy',
  price: 1000,
  summary: 'Test summary',
  description: 'Test description',
  imageCover: 'tour-1-cover.jpg',
  images: ['tour-1-1.jpg', 'tour-1-2.jpg'],
  startDates: [new Date('2025-09-15'), new Date('2025-10-10')],
  startLocation: {
    type: 'Point',
    coordinates: [101.3723, 14.4382],
    address: 'Test Address',
    description: 'Test Location'
  },
  locations: [
    {
      type: 'Point',
      coordinates: [101.3723, 14.4382],
      address: 'Test Address',
      description: 'Test Location',
      day: 1
    }
  ]
};

export const mockReview = {
  review: 'Awesome tour!',
  rating: 5
};

export const mockBooking = {
  price: 1000,
  paid: true
};
