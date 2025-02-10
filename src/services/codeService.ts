import VerificationCode from "../models/codeSchema";

//  Validates if a code is correct and has not expired.
export const validateCode = async (email: string, inputCode: string): Promise<boolean> => {
	const storedCode = await VerificationCode.findOne({ email });

	if (!storedCode) return false;
	if (storedCode.code !== inputCode) return false;

	return true;
};
