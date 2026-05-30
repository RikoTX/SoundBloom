export function SiderText({ siderText }) {
  siderText = siderText.toUpperCase();

  return (
    <div>
      <div className="text-[#cb0094] text-[13px] mb-1 mt-5 flex justify-start ml-[1%] w-full font-semibold">
        {siderText}
      </div>
    </div>
  );
}
