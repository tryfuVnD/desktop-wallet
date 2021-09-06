import { DTO } from "@payvo/profiles";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface UseColumnProperties {
	exchangeCurrency: string | undefined;
	showMemoColumn: boolean | undefined;
}

export const useColumns = ({ exchangeCurrency, showMemoColumn }: UseColumnProperties) => {
	const { t } = useTranslation();

	return useMemo<TableColumn[]>(() => {
		const columnId: TableColumn = {
			Header: t("COMMON.ID"),
			minimumWidth: true,
		};

		const columnDate: TableColumn = {
			Header: t("COMMON.DATE"),
			accessor: (transaction: DTO.ExtendedConfirmedTransactionData) => transaction.timestamp?.()?.toUNIX(),
			cellWidth: "w-50",
			id: "date",
			sortDescFirst: true,
		};

		const columnRecipient: TableColumn = {
			Header: t("COMMON.RECIPIENT"),
			cellWidth: "w-96",
		};

		const columnMemo: TableColumn = {
			Header: t("COMMON.MEMO"),
			cellWidth: "w-24",
			className: "justify-center",
		};

		const columnStatus: TableColumn = {
			Header: t("COMMON.STATUS"),
			cellWidth: "w-20",
			className: "justify-center",
		};

		const columnAmount: TableColumn = {
			Header: t("COMMON.AMOUNT"),
			accessor: (transaction: DTO.ExtendedConfirmedTransactionData) => transaction.total?.(),
			className: "justify-end",
			id: "amount",
			sortDescFirst: true,
		};

		const columnCurrency: TableColumn = {
			Header: t("COMMON.CURRENCY"),
			cellWidth: "w-28",
			className: "justify-end float-right",
			responsiveClass: "hidden xl:table-cell",
		};

		return [
			columnId,
			columnDate,
			columnRecipient,
			showMemoColumn && columnMemo,
			columnStatus,
			columnAmount,
			exchangeCurrency && columnCurrency,
		].filter(Boolean) as TableColumn[];
	}, [t, showMemoColumn, exchangeCurrency]);
};