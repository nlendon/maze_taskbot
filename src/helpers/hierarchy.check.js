// export const HierarchyCheck = (incoming_role)

import { inaccessible_roles } from '../common/constants.js';

export const Access_Checker = (incoming_role) => {
    const is_weak = inaccessible_roles.find((role) => role === incoming_role);
    return !!is_weak;
};
