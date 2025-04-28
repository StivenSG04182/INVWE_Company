import { Header } from "@/components/site/sections/Header";
import { Hero } from "@/components/site/sections/Hero";
import { LogoTicker } from "@/components/site/sections/LogoTicker";
import { Features } from "@/components/site/sections/Features";
import { Testimonials } from "@/components/site/sections/Testimonials";
import { CallToAction } from "@/components/site/sections/CallToAction";
import { Footer } from "@/components/site/sections/Footer";

export default function Home() {
    return (
        <>
            <Header />
            {/* <Hero /> */}
            {/* <LogoTicker /> */}
            {/* <Features /> */}
            <Testimonials />
            <CallToAction />
            <Footer />
        </>
    );
}