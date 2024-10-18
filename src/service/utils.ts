import { ApplicationMessage, JWTPayload } from "../types";
import {
  TEST_MODE,
  BACKEND_API_URL,
  X_API_KEY,
} from "../constants";

export class Utils {
  private static _instance: Utils;
  private _taxonomy_api_key: string = "de80fefe-92b0-44b2-b3d2-5686549c263c";
      //multi-environment testing
  private _env: string = "prod";

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  // For authorized only users we can get environment from the issuer in the cookie
  // async Env(): Promise<string> {
  //   let accessCookie: chrome.cookies.Cookie | null = null;

  //   for (const key in DOMAIN_URL) {
  //     accessCookie = await chrome.cookies.get({
  //       url: DOMAIN_URL[key as keyof typeof DOMAIN_URL],
  //       name: ACCESS_COOKIE,
  //     });
  //     if (accessCookie) {
  //       console.log("Found cookie: ", accessCookie);  
  //       break; // found cookie
  //     }
  //   }

  //   if (accessCookie) {
  //     let payload = Utils.Instance.ParseJwtPayload(accessCookie.value);
  //     return payload.iss.includes("<url to match>") ? "staging" : "prod";
  //   }
  //   return "";
  // }

  async GetFromSession(param: string): Promise<string> {
    try {
      const response = await chrome.storage.session.get(param);
      // console.log("Get value for: " + param + " " + JSON.stringify(response))
      return response[param];
    } catch (error) {
      console.error("There was an issue in GetFromSession", error);
      return "";
    }
  }

  async SetInSession(keyName: string, value: string) {
    console.log("Set value for: " + keyName + " " + value);
    await chrome.storage.session.set({ [keyName]: value });
  }

  async RemoveFromSession(param: Array<string>) {
    await chrome.storage.session.remove(param.map((key) => key));
  }
  async GetSkillsFromText(data: string) {
    let returnObj: ApplicationMessage = {
      message: "No Op GetSkillsFromText",
      error: "",
    };

    try {
      if ((await this.GetFromSession(TEST_MODE)) === "true") {
        console.log(
          "Body that would have been sent to the api: " +
            JSON.stringify({
              data: data,
            })
        );
        returnObj.message =
          "Test mode is on, check the chrome extension console for details.";
        return returnObj;
      }

      const resp = await Utils.Instance.Fetch(
        new URL(
          `${BACKEND_API_URL[this._env as keyof typeof BACKEND_API_URL]}/skills`
        ),
        "POST",
        JSON.stringify({
          data: data,
        }),
        null,
        new Headers([[X_API_KEY, this._taxonomy_api_key]])
      );

      if (!resp || resp.status !== 200 || !resp.body) {
        const responseText = await resp?.text();
        console.error("Error getting the skills!", responseText);
        if (responseText) {
          returnObj.error = responseText;
        }
      } else {
        const val = (await resp?.json()) as ApplicationMessage;
        returnObj.message = JSON.stringify(val.message);
      }
    } catch (error) {
      console.error("Unhandled error getting the skills!", error);
      returnObj.error =
        "There was an unhandled error getting the skills: " + error;
    }
    return returnObj;
  }

  async GetSkillDefinition(data: string) {
    let returnObj: ApplicationMessage = {
      message: "No Op GetSkillDefinition",
      error: "",
    };

    try {
      if ((await this.GetFromSession(TEST_MODE)) === "true") {
        console.log(
          "Body that would have been sent to the api: " +
            JSON.stringify({
              data: data,
            })
        );
        returnObj.message =
          "Test mode is on, check the chrome extension console for details.";
        return returnObj;
      }

      const resp = await Utils.Instance.Fetch(
        new URL(
          `${BACKEND_API_URL[this._env as keyof typeof BACKEND_API_URL]}/skill/${data}`
        ),
        "GET",
        null,
        null,
        new Headers([[X_API_KEY, this._taxonomy_api_key]]) //open to anyone with they key
      );

      if (!resp || resp.status !== 200 || !resp.body) {
        const responseText = await resp?.text();
        console.error("Error getting the skill definition!", responseText);
        if (responseText) {
          returnObj.error = responseText;
        }
      } else {
        const val = (await resp?.json()) as ApplicationMessage;
        returnObj.message = JSON.stringify(val.message);
      }
    } catch (error) {
      console.error("Unhandled error getting the definition!", error);
      returnObj.error =
        "There was an unhandled error getting the definition: " + error;
    }
    return returnObj;
  }

  async GetTitleDefinition(data: string) {
    let returnObj: ApplicationMessage = {
      message: "No Op GetTitleDefinition",
      error: "",
    };

    try {
      if ((await this.GetFromSession(TEST_MODE)) === "true") {
        console.log(
          "Body that would have been sent to the api: " +
            JSON.stringify({
              data: data,
            })
        );
        returnObj.message =
          "Test mode is on, check the chrome extension console for details.";
        return returnObj;
      }

      //todo: Should this be open to anyone in the world?
      // Authorized users will have a cookie we can use for environment and other information
      // or do a login on the window
      const resp = await Utils.Instance.Fetch(
        new URL(
          `${BACKEND_API_URL[this._env as keyof typeof BACKEND_API_URL]}/title/${data}`
        ),
        "GET",
        null,
        null,
        new Headers([[X_API_KEY, this._taxonomy_api_key]]) //open to anyone with they key
      );

      if (!resp || resp.status !== 200 || !resp.body) {
        const responseText = await resp?.text();
        console.error("Error getting the job title definition!", responseText);
        if (responseText) {
          returnObj.error = responseText;
        }
      } else {
        const val = (await resp?.json()) as ApplicationMessage;
        returnObj.message = JSON.stringify(val.message);
      }
    } catch (error) {
      console.error("Unhandled error getting the job title definition!", error);
      returnObj.error =
        "There was an unhandled error getting the job title definition: " + error;
    }
    return returnObj;
  }

  // Wrapper for the Fetch method that accepts a body, beaerer tokens for auth environments
  // api calls, and headers (for sending the access cookie to the lambda backend)
  async Fetch(
    url: URL,
    method: string,
    body: string | null,
    authInfo: JWTPayload | null,
    headers?: Headers | null
  ): Promise<Response | undefined> {
    if (method !== "") {
      // adding the access token to the headers was moved out of here
      // because the existing backend will reject calls with unexpected headers
      let requestHeaders = headers ? headers : new Headers();
      requestHeaders.append("Content-Type", "application/json");
      if (authInfo !== null) {
        requestHeaders.append(
          "Authorization",
          "Bearer " + authInfo?.legacy_token
        );
      }

      //only add the body if it exists, otherwise the fetch will fail
      let payload = {
        method: method,
        headers: requestHeaders,
      };
      payload = { ...payload, ...(body ? { body: body } : {}) };

      try {
        const response: Response = await fetch(url, payload);
        return response;
      } catch (error) {
        console.error("There was an unhandled error in Utils.Fetch", error);
      }
    }
  }
}
