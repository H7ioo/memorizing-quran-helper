import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root.tsx";
import ErrorPage from "./error-page.tsx";
import { GameMenu } from "./components/game.tsx";
import { Hero } from "./components/hero.tsx";
import { Fahras } from "./components/fahras.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Hero /> },
      {
        path: "game/",
        element: <GameMenu />,
      },
      {
        path: "fahras/",
        element: <Fahras />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
