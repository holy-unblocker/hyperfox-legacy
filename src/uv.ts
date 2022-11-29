export async function registerSW() {
  if (!navigator.serviceWorker)
    throw new Error("Your browser doesn't support service workers.");

  await navigator.serviceWorker.register(__uv$config.sw, {
    scope: __uv$config.prefix,
  });
}
