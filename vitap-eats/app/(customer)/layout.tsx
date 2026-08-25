import CustomerHeader from "@/components/customer/CustomerHeader";
import MobileBottomNav from "@/components/customer/MobileBottomNav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerHeader />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
    </>
  );
}
