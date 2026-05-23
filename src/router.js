import React from "react";
import {
  createHashRouter,
  RouterProvider
} from "react-router-dom";

import AppLayout from "./AppLayout";
import DeckList from "./components/deck_list";
import NewDeck from "./components/deck_new";
import DeckDetail from "./components/deck_detail";
import ProxyPage from "./components/proxy_page";
import Intro from "./components/intro";


const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Intro />
      },
      {
        path: "decks",
        element: <DeckList />
      },
      {
        path: "decks/new",
        element: <NewDeck />
      },
      {
        path: "decks/:id",
        element: <DeckDetail />
      },
      {
        path: "proxy/:id",
        element: <ProxyPage />
      }
    ]
  }
]
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}