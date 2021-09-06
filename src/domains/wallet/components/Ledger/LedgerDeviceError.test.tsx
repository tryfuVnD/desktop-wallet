import { Contracts } from "@payvo/profiles";
import React from "react";
import { act, fireEvent, render } from "utils/testing-library";

import { LedgerDeviceError } from "./LedgerDeviceError";

describe("LedgerDeviceError", () => {
	it("should call the onClose callback if given", () => {
		const onClose = jest.fn();

		const { getByTestId } = render(
			<LedgerDeviceError
				isOpen={true}
				onClose={onClose}
				supportedModel={Contracts.WalletLedgerModel.NanoX}
				connectedModel={Contracts.WalletLedgerModel.NanoS}
			/>,
		);

		act(() => {
			fireEvent.click(getByTestId("modal__close-btn"));
		});

		expect(onClose).toHaveBeenCalled();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		const { getByText } = render(
			<LedgerDeviceError
				isOpen={true}
				supportedModel={Contracts.WalletLedgerModel.NanoX}
				connectedModel={Contracts.WalletLedgerModel.NanoS}
				subtitle={subtitle}
			/>,
		);

		expect(getByText(subtitle)).toBeInTheDocument();
	});
});