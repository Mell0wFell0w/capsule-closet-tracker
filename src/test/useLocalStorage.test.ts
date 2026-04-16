import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../hooks/useLocalStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("useLocalStorage", () => {
  it("returns the initial value when key is not set", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("writes to localStorage on setValue", () => {
    const { result } = renderHook(() => useLocalStorage<string>("test-key", ""));
    act(() => {
      result.current[1]("hello");
    });
    expect(localStorage.getItem("test-key")).toBe('"hello"');
    expect(result.current[0]).toBe("hello");
  });

  it("reads an existing value from localStorage on mount", () => {
    localStorage.setItem("existing-key", JSON.stringify(42));
    const { result } = renderHook(() => useLocalStorage("existing-key", 0));
    expect(result.current[0]).toBe(42);
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });

  it("returns initial value when localStorage data is malformed", () => {
    localStorage.setItem("bad-key", "not-json{{{{");
    const { result } = renderHook(() => useLocalStorage("bad-key", []));
    expect(result.current[0]).toEqual([]);
  });
});
