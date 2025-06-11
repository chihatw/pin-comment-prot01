import ClientRoot from '../../components/ClientRoot';

// (clientroot) グループレイアウト: ClientRootでchildrenをラップ
export default function ClientRootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientRoot>{children}</ClientRoot>;
}
