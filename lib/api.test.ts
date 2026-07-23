import { fetchLogs, ApiError } from "@/lib/api";
import { exportRequest, logRecord } from "@/lib/__fixtures__/otlp";

function mockFetchResolvedValue(value: unknown) {
  global.fetch = jest.fn().mockResolvedValue(value) as unknown as typeof fetch;
}

describe("fetchLogs", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the parsed payload for a response matching the OTLP shape", async () => {
    const payload = exportRequest([
      { serviceName: "svc", records: [logRecord()] },
    ]);
    mockFetchResolvedValue({ ok: true, json: async () => payload });

    await expect(fetchLogs()).resolves.toEqual(payload);
  });

  it("throws ApiError carrying the status on a non-ok response", async () => {
    mockFetchResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(fetchLogs()).rejects.toBeInstanceOf(ApiError);
    await expect(fetchLogs()).rejects.toMatchObject({ status: 500 });
  });

  it("rejects a response that doesn't match the OTLP shape", async () => {
    mockFetchResolvedValue({
      ok: true,
      json: async () => ({ resourceLogs: [{ notAnOtlpRecord: true }] }),
    });

    await expect(fetchLogs()).rejects.toThrow();
  });

  it("forwards the abort signal to fetch", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => exportRequest([]) });
    global.fetch = fetchMock as unknown as typeof fetch;
    const controller = new AbortController();

    await fetchLogs(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
