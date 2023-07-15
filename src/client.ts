import React, { useContext, useState } from "react";
import { SetList, SetListIdentifier, SetListValue } from "./model";

class SetlistManager {
  private endpoint = "/api/setlist";
  private storageKeyPrefix = "SetlistManager";
  private storage = localStorage;

  private async callAPI(
    path: string = "",
    options: Parameters<typeof fetch>[1] = {},
    body?: any,
  ) {
    const res = await fetch(this.endpoint + path, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "content-type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    return res.json();
  }

  public async get(id: SetListIdentifier): Promise<SetList> {
    const setlist = await this.callAPI("?id=" + id, {});
    return {
      ...setlist,
      get displayName() {
        return this.band.name + this.event.name;
      },
    } as SetList;
  }
  public async create(value: SetListValue): Promise<SetListIdentifier> {
    return this.callAPI("", { method: "post" }, value);
  }
  public async update(id: SetListIdentifier, value: SetListValue) {
    return this.callAPI("?id=" + id, { method: "put" }, { ...value });
  }

  private get historyKey() {
    return this.storageKeyPrefix + "-history";
  }
  public getHistory(): string[] {
    return JSON.parse(this.storage.getItem(this.historyKey) || "[]");
  }
  public pushToHistory(id: string) {
    this.storage.setItem(
      this.historyKey,
      JSON.stringify([...this.getHistory(), id]),
    );
  }
}

const SetlistManagerContext = React.createContext<SetlistManager | null>(null);
export function SetlistManagerProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [manager] = useState(() => new SetlistManager());

  return React.createElement(SetlistManagerContext.Provider, {
    value: manager,
    children,
  });
}

export function useSetlistManager() {
  const manager = useContext(SetlistManagerContext);
  if (!manager) {
    throw new Error();
  }
  return manager;
}
