let sessionStorage = {};

global.chrome = {
  storage: {
    session: {
      get: jest.fn((key) => {
        return {[key]: sessionStorage[key]};
      }),
      set: jest.fn((input) => {
        console.log("set in session called");
        sessionStorage[Object.keys(input)[0]] = input[Object.keys(input)[0]];
      }),
      remove: jest.fn((key) => {
        delete sessionStorage[key];
      }),
      clear: jest.fn(() => {
        sessionStorage = {};
      }),
    },
  },
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ status: 200 }),
  }),
);