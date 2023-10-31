import { roles } from '../common/constants.js';

export const RoleValidator = (payload_role) => {
    const result = roles.find((system_role) => system_role === payload_role);
    return !!result;
};
