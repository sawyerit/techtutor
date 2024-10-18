// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/jest-globals";

// global.fetch = jest.fn(() =>
//     Promise.resolve({
//       json: () => Promise.resolve({ status: 200 }),
//     })
//   ) as jest.Mock;

  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ status: 200 }), // Example response
  });

declare global {
    interface Window {
      chrome: typeof chrome;
    }
  }

interface Map {
  [key: string]: any | undefined;
}

// jest.mock('chrome', () => {
//     // Partial mock for chrome
//     let sessionStorage: Map = {};
//     const onChangedMock: chrome.storage.StorageChangedEvent = {
//         addListener: jest.fn(),
//         removeListener: jest.fn(),
//         getRules: jest.fn(),
//         hasListener: jest.fn(),
//         removeRules: jest.fn(),
//         addRules: jest.fn(),
//         hasListeners: function (): boolean {
//           throw new Error("Function not implemented.");
//         },
//       };
      
//     const chromeMock: Partial<typeof chrome> = {
//         storage: {
//             session: {
//               //get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
//               get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
//                 let result = {};
//                 if (Array.isArray(keys)) {
//                   keys.forEach(function (key) {
//                     if (sessionStorage.getItem(key)) {
//                       result = {
//                         ...result,
//                         [key]: JSON.parse(sessionStorage.getItem(key)),
//                       };
//                     }
//                   });
//                 } else {
//                   if (keys.constructor.name === "Object") {
//                     let all_keys: Map = {};
//                     for (const [key, value] of Object.entries(keys)) {
//                       let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
//                       all_keys[key] = ls_stored_value;
//                     }
//                     result = all_keys;
//                   } else {
//                     if (sessionStorage.getItem(keys.toString())) {
//                       result = {
//                         ...result,
//                         [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
//                       };
//                     }
//                   }
//                 }
//                 return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
//               }),
//               set: jest.fn((input) => {
//                 sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
//                 return Promise.resolve();
//               }),
//               remove: jest.fn((key: string) => {
//                 delete sessionStorage[key[0]];
//                 return Promise.resolve();
//               }),
//               clear: jest.fn(() => {
//                 sessionStorage = {};
//                 return Promise.resolve();
//               }),
//               QUOTA_BYTES: 0,
//               setAccessLevel: function (accessOptions: {
//                 accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
//               }): Promise<void> {
//                 throw new Error("Function not implemented.");
//               },
//               // getBytesInUse(keys?: string | string[] | null): Promise<number>;
//               //getBytesInUse(callback: (bytesInUse: number) => void): void;
//               getBytesInUse: jest.fn(),
//               onChanged: onChangedMock,
//             },
//             AccessLevel: {
//               TRUSTED_AND_UNTRUSTED_CONTEXTS: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
//               TRUSTED_CONTEXTS: "TRUSTED_CONTEXTS",
//             },
//             local: {
//                 get: jest.fn(),
//                 set: jest.fn(),
//                 remove: jest.fn(),
//                 clear: jest.fn(),
//                 getBytesInUse: jest.fn(),
//                 setAccessLevel: jest.fn(), // Add the missing property for LocalStorageArea
//                 onChanged: {} as chrome.storage.StorageChangedEvent, // Add onChanged to match StorageArea
//                 QUOTA_BYTES: 0, // Include QUOTA_BYTES even if not used
//               },
//             sync: {
//               //get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
//               get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
//                 let result = {};
//                 if (Array.isArray(keys)) {
//                   keys.forEach(function (key) {
//                     if (sessionStorage.getItem(key)) {
//                       result = {
//                         ...result,
//                         [key]: JSON.parse(sessionStorage.getItem(key)),
//                       };
//                     }
//                   });
//                 } else {
//                   if (keys.constructor.name === "Object") {
//                     let all_keys: Map = {};
//                     for (const [key, value] of Object.entries(keys)) {
//                       let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
//                       all_keys[key] = ls_stored_value;
//                     }
//                     result = all_keys;
//                   } else {
//                     if (sessionStorage.getItem(keys.toString())) {
//                       result = {
//                         ...result,
//                         [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
//                       };
//                     }
//                   }
//                 }
//                 return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
//               }),
//               set: jest.fn((input) => {
//                 sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
//                 return Promise.resolve();
//               }),
//               remove: jest.fn((key: string) => {
//                 delete sessionStorage[key[0]];
//                 return Promise.resolve();
//               }),
//               clear: jest.fn(() => {
//                 sessionStorage = {};
//                 return Promise.resolve();
//               }),
//               QUOTA_BYTES: 0,
//               setAccessLevel: function (accessOptions: {
//                 accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
//               }): Promise<void> {
//                 throw new Error("Function not implemented.");
//               },
//               // getBytesInUse(keys?: string | string[] | null): Promise<number>;
//               //getBytesInUse(callback: (bytesInUse: number) => void): void;
//               getBytesInUse: jest.fn(),
//               onChanged: onChangedMock,
//               MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 0,
//               QUOTA_BYTES_PER_ITEM: 0,
//               MAX_ITEMS: 0,
//               MAX_WRITE_OPERATIONS_PER_HOUR: 0,
//               MAX_WRITE_OPERATIONS_PER_MINUTE: 0,
//             },
//             managed: {
//               //get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
//               get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
//                 let result = {};
//                 if (Array.isArray(keys)) {
//                   keys.forEach(function (key) {
//                     if (sessionStorage.getItem(key)) {
//                       result = {
//                         ...result,
//                         [key]: JSON.parse(sessionStorage.getItem(key)),
//                       };
//                     }
//                   });
//                 } else {
//                   if (keys.constructor.name === "Object") {
//                     let all_keys: Map = {};
//                     for (const [key, value] of Object.entries(keys)) {
//                       let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
//                       all_keys[key] = ls_stored_value;
//                     }
//                     result = all_keys;
//                   } else {
//                     if (sessionStorage.getItem(keys.toString())) {
//                       result = {
//                         ...result,
//                         [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
//                       };
//                     }
//                   }
//                 }
//                 return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
//               }),
//               set: jest.fn((input) => {
//                 sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
//                 return Promise.resolve();
//               }),
//               remove: jest.fn((key: string) => {
//                 delete sessionStorage[key[0]];
//                 return Promise.resolve();
//               }),
//               clear: jest.fn(() => {
//                 sessionStorage = {};
//                 return Promise.resolve();
//               }),
//               setAccessLevel: function (accessOptions: {
//                 accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
//               }): Promise<void> {
//                 throw new Error("Function not implemented.");
//               },
//               // getBytesInUse(keys?: string | string[] | null): Promise<number>;
//               //getBytesInUse(callback: (bytesInUse: number) => void): void;
//               getBytesInUse: jest.fn(),
//               onChanged: onChangedMock,
//             },
//             onChanged: onChangedMock,
//           },
//       };
//     return chromeMock as typeof chrome;
//   });

  let sessionStorage: Map = {};
  const onChangedMock: chrome.storage.StorageChangedEvent = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      getRules: jest.fn(),
      hasListener: jest.fn(),
      removeRules: jest.fn(),
      addRules: jest.fn(),
      hasListeners: function (): boolean {
        throw new Error("Function not implemented.");
      },
    };

  const chromeMock: Partial<typeof chrome> = {
    storage: {
        session: {
          get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
            let result = {};
            if (Array.isArray(keys)) {
              keys.forEach(function (key) {
                if (sessionStorage.getItem(key)) {
                  result = {
                    ...result,
                    [key]: JSON.parse(sessionStorage.getItem(key)),
                  };
                }
              });
            } else {
              if (keys.constructor.name === "Object") {
                let all_keys: Map = {};
                for (const [key, value] of Object.entries(keys)) {
                  let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
                  all_keys[key] = ls_stored_value;
                }
                result = all_keys;
              } else {
                if (sessionStorage.getItem(keys.toString())) {
                  result = {
                    ...result,
                    [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
                  };
                }
              }
            }
            return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
          }),
          set: jest.fn((input) => {
            sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
            return Promise.resolve();
          }),
          remove: jest.fn((key: string) => {
            delete sessionStorage[key[0]];
            return Promise.resolve();
          }),
          clear: jest.fn(() => {
            sessionStorage = {};
            return Promise.resolve();
          }),
          QUOTA_BYTES: 0,
          setAccessLevel: function (accessOptions: {
            accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
          }): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getBytesInUse: jest.fn(),
          onChanged: onChangedMock,
        },
        AccessLevel: {
          TRUSTED_AND_UNTRUSTED_CONTEXTS: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
          TRUSTED_CONTEXTS: "TRUSTED_CONTEXTS",
        },
        local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn(),
            getBytesInUse: jest.fn(),
            setAccessLevel: jest.fn(), // Add the missing property for LocalStorageArea
            onChanged: {} as chrome.storage.StorageChangedEvent, // Add onChanged to match StorageArea
            QUOTA_BYTES: 0, // Include QUOTA_BYTES even if not used
          },
        sync: {
          //get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
          get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
            let result = {};
            if (Array.isArray(keys)) {
              keys.forEach(function (key) {
                if (sessionStorage.getItem(key)) {
                  result = {
                    ...result,
                    [key]: JSON.parse(sessionStorage.getItem(key)),
                  };
                }
              });
            } else {
              if (keys.constructor.name === "Object") {
                let all_keys: Map = {};
                for (const [key, value] of Object.entries(keys)) {
                  let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
                  all_keys[key] = ls_stored_value;
                }
                result = all_keys;
              } else {
                if (sessionStorage.getItem(keys.toString())) {
                  result = {
                    ...result,
                    [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
                  };
                }
              }
            }
            return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
          }),
          set: jest.fn((input) => {
            sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
            return Promise.resolve();
          }),
          remove: jest.fn((key: string) => {
            delete sessionStorage[key[0]];
            return Promise.resolve();
          }),
          clear: jest.fn(() => {
            sessionStorage = {};
            return Promise.resolve();
          }),
          QUOTA_BYTES: 0,
          setAccessLevel: function (accessOptions: {
            accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
          }): Promise<void> {
            throw new Error("Function not implemented.");
          },
          // getBytesInUse(keys?: string | string[] | null): Promise<number>;
          //getBytesInUse(callback: (bytesInUse: number) => void): void;
          getBytesInUse: jest.fn(),
          onChanged: onChangedMock,
          MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 0,
          QUOTA_BYTES_PER_ITEM: 0,
          MAX_ITEMS: 0,
          MAX_WRITE_OPERATIONS_PER_HOUR: 0,
          MAX_WRITE_OPERATIONS_PER_MINUTE: 0,
        },
        managed: {
          //get(keys?: string | string[] | { [key: string]: any } | null): Promise<{ [key: string]: any }>;
          get: jest.fn((keys: string | string[] | { [key: string]: any }) => {
            let result = {};
            if (Array.isArray(keys)) {
              keys.forEach(function (key) {
                if (sessionStorage.getItem(key)) {
                  result = {
                    ...result,
                    [key]: JSON.parse(sessionStorage.getItem(key)),
                  };
                }
              });
            } else {
              if (keys.constructor.name === "Object") {
                let all_keys: Map = {};
                for (const [key, value] of Object.entries(keys)) {
                  let ls_stored_value = JSON.parse(sessionStorage.getItem(key));
                  all_keys[key] = ls_stored_value;
                }
                result = all_keys;
              } else {
                if (sessionStorage.getItem(keys.toString())) {
                  result = {
                    ...result,
                    [keys.toString()]: JSON.parse(sessionStorage.getItem(keys)),
                  };
                }
              }
            }
            return Promise.resolve(result); //Promise.resolve({keys: sessionStorage[keys]});
          }),
          set: jest.fn((input) => {
            sessionStorage[Object.keys(input)[0]] = input[Object.values(input)[0]];
            return Promise.resolve();
          }),
          remove: jest.fn((key: string) => {
            delete sessionStorage[key[0]];
            return Promise.resolve();
          }),
          clear: jest.fn(() => {
            sessionStorage = {};
            return Promise.resolve();
          }),
          setAccessLevel: function (accessOptions: {
            accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" | "TRUSTED_CONTEXTS";
          }): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getBytesInUse: jest.fn(),
          onChanged: onChangedMock,
        },
        onChanged: onChangedMock,
      },

  };
  (global as any).window.chrome = chromeMock;
