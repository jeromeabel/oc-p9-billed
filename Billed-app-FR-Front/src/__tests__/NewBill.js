/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom" // Queries DOM
import { toHaveClass } from "@testing-library/jest-dom" // Custom matchers DOM
import userEvent from '@testing-library/user-event' // Events click, keyboards

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import router from '../app/Router';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from "../__mocks__/store";

// Mock the navigation
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }

// -------- UNIT TESTS --------- //
describe('Given I am connected as an employee', () => {

  // Set Mock Local Storage as Employee for All Tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  })

  describe('When I am on NewBill Page', () => {
    test('Then mail icon in vertical layout should be highlighted', async () => {
      // Arrange : create Vertical Layout for NewBill
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Act : simulate navigation
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // Wait for Icon
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');

      // Assert : icon is highlighted when it the "active-icon" class is present
      expect(mailIcon).toHaveClass('active-icon');
    });
  });

  describe('When I submit the form with empty fields', () => {
    test('Then I should stay on NewBill Page', () => {
      // Arrange : create NewBill HTML
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });

      // Get Form
      const form = screen.getByTestId('form-new-bill');

      // Assert 1 : Inputs
      expect(screen.getByTestId('expense-name').value).toBe('');
      expect(screen.getByTestId('datepicker').value).toBe('');
      expect(screen.getByTestId('amount').value).toBe('');
      expect(screen.getByTestId('vat').value).toBe('');
      expect(screen.getByTestId('pct').value).toBe('');
      expect(screen.getByTestId('file').value).toBe('');

      // Act : Form submit (event)
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      // Assert 2 : Form
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });

  describe('When I upload a file with the wrong format', () => {
    test('Then it should display the error message', async () => {
      // Arrange 
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });
      const inputFile = screen.getByTestId('file');

      // Arrange Data : test file
      const errorFile = new File(['test-file'], 'test-file.txt', { type: 'text/plain' });

      // Act : upload the file (event)
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      inputFile.addEventListener('change', handleChangeFile);
      userEvent.upload(inputFile, errorFile);

      // Assert
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].type).toBe('text/plain');

      // Assert : error message is visible
      await waitFor(() => screen.getByTestId('file-error-message'));
      expect(screen.getByTestId('file-error-message')).not.toHaveClass("d-none");
    });
  });

  describe('When I upload a file with the good format', () => {
    test('Then it should display the file name and hide the error message', async () => {
      // Arrange
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const inputFile = screen.getByTestId('file');

      // Arrange Data : test file
      const goodFile = new File(['test-file'], 'test-file.png', { type: 'image/png' });

      // Act : upload the file (event)
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      inputFile.addEventListener('change', handleChangeFile);
      userEvent.upload(inputFile, goodFile);

      // Assert
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe('test-file.png');
      expect(inputFile.files[0].type).toBe('image/png');
      expect(inputFile.files[0]).toStrictEqual(goodFile);

      // Assert : error message is not visible
      await waitFor(() => screen.getByTestId('file-error-message'));
      expect(screen.getByTestId('file-error-message')).toHaveClass("d-none");
    });
  });
});

// -------- INTEGRATION TESTS (POST) --------- //
describe('Given I am connected as Employee on NewBill Page', () => {

  // Set Mock Local Storage as Employee for All Tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  })

  describe('When API is working', () => {
    test('Then it should send an Mock POST request and return to the Bills Page', async () => {

      // Arrange
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      //const createdBill = await mockStore.bills().create(null); // New Mock Bill
      const form = screen.getByTestId('form-new-bill');
      const btnSubmit = document.getElementById("btn-send-bill");

      // Mock functions
      jest.spyOn(mockStore, 'bills');
      newBill.updateBill = jest.fn();
    
      // Mocked data
      const mockedBill = {
        email: undefined,
        type: "Transports",
        name: "Vol La Rochelle - Lyon",
        date: "2022-12-10",
        amount: 150,
        vat: "20",
        pct: 10,
        commentary: "Réunion mission Billed",
        fileUrl: "./justificatif.png",
        fileName: "justificatif.png",
        status: "pending",
      }
      
      // Fill form fields with mocked data
      screen.getByTestId("expense-type").value = mockedBill.type;
      screen.getByTestId("expense-name").value = mockedBill.name;
      screen.getByTestId("datepicker").value = mockedBill.date;
      screen.getByTestId("amount").value = mockedBill.amount;
      screen.getByTestId("vat").value = mockedBill.vat;
      screen.getByTestId("pct").value = mockedBill.pct;
      screen.getByTestId("commentary").value = mockedBill.commentary;
      newBill.fileName = mockedBill.fileName;
      newBill.fileUrl = mockedBill.fileUrl;

      // Act : form submit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      userEvent.click(btnSubmit);

      // Assert : mocked function
      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalledWith( mockedBill );
      expect(mockStore.bills).toHaveBeenCalled();

      // Assert : returns to the Bills Page
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  });

  describe('When an error occurs on POST request API', () => {
    test('Then it should console a message error', async () => {

      // Arrange
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Mock functions : mockStore.bills and console.error()
      jest.spyOn(mockStore, 'bills');
      console.error = jest.fn();
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const btnSubmit = document.getElementById("btn-send-bill");

      // Act : form submit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      userEvent.click(btnSubmit);

      // Assert
      expect(handleSubmit).toHaveBeenCalled();
      await new Promise(process.nextTick);
      expect(console.error).toHaveBeenCalled();
    });
  });
});