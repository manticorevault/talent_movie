import { type PropsWithChildren } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
// import { Provider } from 'react-redux'
// import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
// import { setupStore, type AppStore, type RootState } from '@app/store'
// import { routeTree } from '@app/router'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<unknown>;
  store?: unknown;
  initialPath?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    // preloadedState = {},
    // store = setupStore(preloadedState),
    // initialPath = '/movies',
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  // const router = createRouter({
  //     routeTree,
  //     history: createMemoryHistory({ initialEntries: [initialPath] }),
  // })

  function Wrapper({ children }: PropsWithChildren) {
    return (
      // <Provider store={store}>
      //     <RouterProvider router={router} />
      //     {children}
      // </Provider>
      <>{children}</>
    );
  }
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
