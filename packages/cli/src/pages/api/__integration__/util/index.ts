import nodeFetch from "node-fetch";
import fetchCookie from "fetch-cookie";
export const fetch: any = fetchCookie(nodeFetch);

export function cliUrl(path: string) {
  return "http://localhost:3883" + path;
}

export abstract class Api<TFormData = undefined> {
  abstract path: string;
  formData: TFormData;
  fetchData: any;
  response?: Awaited<ReturnType<typeof fetch>>;

  defaultFetchData = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  constructor(formData: TFormData) {
    this.formData = { ...formData };
  }

  async perform() {
    console.log("this.formData in perform is", this.formData);
    this.fetchData = {
      ...this.defaultFetchData,
    };

    if ("POST" === this.fetchData.method) {
      this.fetchData.body = JSON.stringify(this.formData);
    }

    this.response = await fetch(this.path, this.fetchData);

    return this;
  }

  updateFormData(data: TFormData) {
    this.formData = data;
  }
}
