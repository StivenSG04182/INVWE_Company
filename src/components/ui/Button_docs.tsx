export const Button = (props: React.PropsWithChildren) => {
  return (
    <button className="relative py-2 px-3 rounded-lg font-medium text-sm bg-gradient-to-b from-[#a4c5ec] to-[#d9dee4] shadow-[0px_0px_12px_#8c45ff]">
      <div className="absolute inset-0">
        <div className=" rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent) ]"></div>
        <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to-top,black,transparent)]"></div>
        <div className="absolute inset-0 shadow-[0_0_10px_rgba(18,18,18,.7)_inset] rounded-lg"></div>
      </div>
      <span>{props.children}</span>
    </button>
  );
};
