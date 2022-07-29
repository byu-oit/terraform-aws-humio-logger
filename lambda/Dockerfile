# Using the official AWS Lambda NodeJS image
# Node Image Repository: https://github.com/aws/aws-lambda-base-images/tree/nodejs16.x
# Docs: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
FROM public.ecr.aws/lambda/nodejs:16 as base

# An empty file that we can "copy" around to create dependencies between build stages
RUN echo -n > /noop

# The lambda task root is where the source code should go
WORKDIR $LAMBDA_TASK_ROOT

# Copy over src files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Compile the source code, should output dist directory
FROM base as build
COPY src ./src/
COPY tsconfig*.json ./
RUN npm ci
RUN npm run build

# Audit dependencies
FROM build as audit
RUN echo '\nNode version:' \
 && node --version \
 && echo '\nnpm version:' \
 && npm --version \
 && echo '\nOutdated Packages:' \
 && npm outdated || true \
 && echo '' \
 && npm audit --audit-level critical

# Check code style
FROM build as lint
COPY .eslintrc.js .
RUN npm run lint

# Run tests
FROM build as unittest
COPY test ./test/
COPY static ./static/
COPY jest.config.js .
RUN npm test

# You can target this stage to check that all the tests pass
FROM base as test
COPY --from=build $LAMBDA_TASK_ROOT/dist ./dist/
COPY --from=audit /noop /
COPY --from=lint /noop /
COPY --from=unittest /noop /

# Note that test is basically identical to base, except that it requires that all tests pass
FROM test as release
ENV NODE_ENV="production"

# Pass in the lambda handler function location argument
CMD ["dist/log_ingester.handler"]

# https://docs.docker.com/engine/reference/builder/
