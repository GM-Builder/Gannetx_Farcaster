import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';

interface CheckinTransactionProps {
    chainId: number;
    contractAddress: string;
    abi: any[];
    currentTax: bigint;
    chainName: string;
    onSuccess?: (txHash: string) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

export function CheckinTransaction({
    chainId,
    contractAddress,
    abi,
    currentTax,
    chainName,
    onSuccess,
    onError,
    disabled
}: CheckinTransactionProps) {
    // Use contracts format for OnchainKit Transaction
    const contracts = [{
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'activateBeacon',
        args: [],
    }];

    const handleStatus = (status: LifecycleStatus) => {
        console.log('Transaction status:', status.statusName);

        if (status.statusName === 'success' && status.statusData) {
            const txHash = status.statusData.transactionReceipts?.[0]?.transactionHash;
            if (txHash) {
                console.log('✅ Transaction successful:', txHash);
                onSuccess?.(txHash);
            }
        } else if (status.statusName === 'error' && status.statusData) {
            console.error('❌ Transaction error:', status.statusData);
            onError?.(status.statusData);
        }
    };

    // Use calls format with value
    const calls = [{
        to: contractAddress as `0x${string}`,
        data: undefined,
        value: currentTax,
    }];

    return (
        <Transaction
            chainId={chainId}
            contracts={contracts as any}
            calls={calls as any}
            onStatus={handleStatus}
        >
            <TransactionButton
                text={`GM on ${chainName}`}
                disabled={disabled}
                className="w-full mt-3 py-3 px-4 text-sm font-medium rounded-xl"
            />
            <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
            </TransactionStatus>
        </Transaction>
    );
}
