/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'

import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"

// MockStore for Integration Tests
jest.mock("../app/Store", () => mockStore) 

// Mock the navigation
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }


// -------- UNIT TESTS --------- //
describe("Given I am connected as an employee", () => {

  // Set Mock Local Storage as Employee for All Tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  })

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      // Test if icon is active (= highlighted)
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills }); // Fill the page
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML)
      const antiChrono = (a, b) => b - a; // Debug sort compare function
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })

    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })

    describe('When I click on all eye icons', () => {
      test('Then it should open the modal', () => {

        // Fill the page with data
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage });

        // Mock (imitation) JQuery modal function
        $.fn.modal = jest.fn();

        // Get Elements
        const eyeIcons = screen.getAllByTestId('icon-eye');
        const openModal = jest.fn(billsContainer.handleClickIconEye);
        const modal = screen.getByTestId('modalFileEmployee'); // > BillsUI

        // Set Events & Click on Icons
        eyeIcons.forEach((icon) => {
          icon.addEventListener('click', (e) => openModal(icon))
          userEvent.click(icon);
        })

        // Assertions : HTML
        expect(modal).toBeTruthy(); // Le code HTML de la modale est présent dans la page
        expect(screen.getByText("Justificatif")).toBeTruthy(); // Le titre de la modale est présent

        // Assertions : click > img
        const img = screen.getByTestId("modalBillImg"); // > Bills ou query "div.bill-proof-container > img"
        expect(img).toHaveAttribute('src', bills[bills.length - 1].fileUrl); // Check the last call URL

        // Assertions : click > functions calls
        expect($.fn.modal).toHaveBeenCalledWith('show'); // La fonction modal a été appelée avec l'argument "show"
        expect(openModal).toHaveBeenCalledTimes(eyeIcons.length) // La fonction callback de l'événement a été appelée autant de fois que le nombre de click
      })
    })

    describe('When I click on the New Bill Button', () => {
      test('Then it should open the NewBill form', () => {

        // Fill the page with data
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage });

        // Get Elements
        const openNewBill = jest.fn(billsContainer.handleClickNewBill);
        const btnNewBill = screen.getByTestId("btn-new-bill");

        // Set Events
        btnNewBill.addEventListener('click', openNewBill);
        userEvent.click(btnNewBill);

        // Assertions : click > fn and HTML
        expect(openNewBill).toHaveBeenCalled(); // La fonction a été appelée
        expect(screen.getByTestId('form-new-bill')).toBeTruthy(); // Le formulaire est présent
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); // Le titre est présent
      })
    })

  }) // Bills Page

}) // Unit Test - Employee


// -------- INTEGRATION TESTS (GET) --------- //
describe("Bills integrations tests", () => {

  describe("Given I am a user connected as Employee", () => {

    // Set Mock Local Storage as Employee for All Tests
    beforeAll(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
    })

    describe("When I am on Bills Page", () => {
      test("Then fetches bills from mock API GET", async () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

        await waitFor(() => screen.getByText("Mes notes de frais"))
        const billsLoaded = await billsContainer.getBills();

        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        expect(billsLoaded.length).toBe(4);
      })
    })

    describe("When an error occurs on API", () => {

      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      })

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      })

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      })
    })

  }) // Employee
}) // Integration Test 
